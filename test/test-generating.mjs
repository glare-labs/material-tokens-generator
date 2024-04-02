import { EMaterialContrastLevel, EMaterialVariant, MaterialDynamicSchemeGenerator } from '../build/index.js'

const colorConfiguration = {
    color: 'rgba(25, 99, 128, 1)',
    isDakk: false,
    contrastLevel: EMaterialContrastLevel.Default,
    variant: EMaterialVariant.VIBRANT,
}

const generateSchemeByVariant = () => {
    const generated = MaterialDynamicSchemeGenerator.GenerateByVariant(colorConfiguration.color, {
        contrastLevel: colorConfiguration.contrastLevel,
        isDark: colorConfiguration.isDakk,
        variant: colorConfiguration.variant,
    })

    const objValue = generated.value
    const objStylesText = generated.ToStyleText()

    console.log(objValue, objStylesText);

    return objStylesText
}

const generateSchemeByPalette = () => {
    const generated = MaterialDynamicSchemeGenerator.GenerateByPalette(colorConfiguration.color, {
        contrastLevel: colorConfiguration.contrastLevel,
        isDark: colorConfiguration.isDakk,
        variant: colorConfiguration.variant,
        primaryPalette: colorConfiguration.color,
        secondaryPalette: colorConfiguration.color,
        tertiaryPalette: colorConfiguration.color,
        neutralPalette: colorConfiguration.color,
        neutralVariantPalette: colorConfiguration.color,
    })

    const objValue = generated.value
    const objStylesText = generated.ToStyleText()

    console.log(objValue, objStylesText);

    return objStylesText
}

export function TestGeneratingScheme() {
    const schemeRes = generateSchemeByVariant()
    const paletteRes = generateSchemeByPalette()
}