import { ref, watchEffect } from 'vue';
import i18next from 'i18next';

export default function useInternationalization(key: string) {
    const translation = ref(i18next.t(`frontend.${key}`));

    // Update the translation when the language changes
    const updateTranslation = () => {
        translation.value = i18next.t(`frontend.${key}`);
    };

    // Watch for language changes
    i18next.on('languageChanged', updateTranslation);

    // Clean up the listener when the composable is no longer used
    watchEffect((onInvalidate) => {
        onInvalidate(() => {
            i18next.off('languageChanged', updateTranslation);
        });
    });

    return translation;
}
