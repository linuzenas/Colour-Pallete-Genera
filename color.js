const ColorUtils = {
    rgbToHSV(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;

        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, v * 100];
    },

    hsvToRGB(h, s, v) {
        h /= 360, s /= 100, v /= 100;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        let r, g, b;
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    },

    rgbToHex(r, g, b) {
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },

    hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }
};

const ColorTheory = {
    getTheoryInfo(scheme) {
        const theories = {
            "Complementary": "Colors opposite each other on the color wheel. Creates high contrast and visual interest.",
            "Analogous": "Colors adjacent on the color wheel. Creates harmonious and serene color schemes.",
            "Triadic": "Three colors evenly spaced on the color wheel. Provides vibrant contrast while maintaining balance.",
            "Monochromatic": "Variations of a single color. Creates a cohesive and elegant color palette."
        };
        return theories[scheme] || "";
    }
};

function generatePalette(baseColor, schemeType, saturation, brightness) {
    const [h, s, v] = ColorUtils.rgbToHSV(...baseColor);
    const adjustedS = Math.min(s * (saturation / 100), 100);
    const adjustedV = Math.min(v * (brightness / 100), 100);
    const colors = [baseColor];

    switch (schemeType) {
        case "Complementary":
            colors.push(ColorUtils.hsvToRGB((h + 180) % 360, adjustedS, adjustedV));
            break;
        case "Analogous":
            colors.push(ColorUtils.hsvToRGB((h - 30 + 360) % 360, adjustedS, adjustedV));
            colors.push(ColorUtils.hsvToRGB((h + 30) % 360, adjustedS, adjustedV));
            break;
        case "Triadic":
            colors.push(ColorUtils.hsvToRGB((h + 120) % 360, adjustedS, adjustedV));
            colors.push(ColorUtils.hsvToRGB((h + 240) % 360, adjustedS, adjustedV));
            break;
        case "Monochromatic":
            colors.push(ColorUtils.hsvToRGB(h, adjustedS, adjustedV * 0.7));
            colors.push(ColorUtils.hsvToRGB(h, adjustedS, adjustedV * 0.5));
            break;
    }

    return colors;
}

// Event Listeners
document.getElementById('generate-btn').addEventListener('click', () => {
    const baseColorHex = document.getElementById('base-color').value;
    const baseColor = ColorUtils.hexToRGB(baseColorHex);
    const scheme = document.querySelector('input[name="scheme"]:checked').value;
    const saturation = document.getElementById('saturation').value;
    const brightness = document.getElementById('brightness').value;
    
    const palette = generatePalette(baseColor, scheme, saturation, brightness);
    const paletteDisplay = document.getElementById('palette-display');
    const theoryText = document.getElementById('theory-text');
    
    // Update color theory information
    theoryText.textContent = ColorTheory.getTheoryInfo(scheme);
    
    paletteDisplay.innerHTML = '';
    palette.forEach(color => {
        const colorBlock = document.createElement('div');
        colorBlock.className = 'color-block';
        colorBlock.style.backgroundColor = `rgb(${color[0]},${color[1]},${color[2]})`;
        
        const colorInfo = document.createElement('div');
        colorInfo.className = 'color-info';
        const hexCode = ColorUtils.rgbToHex(...color);
        colorInfo.innerHTML = `
            <div>Hex: ${hexCode}</div>
            <div>RGB: ${color.join(', ')}</div>
        `;
        
        colorBlock.appendChild(colorInfo);
        paletteDisplay.appendChild(colorBlock);
    });
});

// Copy All Colors Button
document.getElementById('copy-btn').addEventListener('click', () => {
    const colors = Array.from(document.querySelectorAll('#palette-display .color-block'))
        .map(block => block.querySelector('.color-info').textContent.split('\n')[0].replace('Hex: ', ''));
    
    navigator.clipboard.writeText(colors.join(', ')).then(() => {
        alert('Colors copied to clipboard!');
    });
});

// Export Palette Button
document.getElementById('export-btn').addEventListener('click', () => {
    const colors = Array.from(document.querySelectorAll('#palette-display .color-block'))
        .map(block => block.querySelector('.color-info').textContent);
    
    const blob = new Blob([colors.join('\n')], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color_palette.txt';
    a.click();
    URL.revokeObjectURL(url);
});