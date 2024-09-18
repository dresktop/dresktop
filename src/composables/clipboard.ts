export default async function useClipboard(text: string) {
    await window.backendAPI.copyToClipboard(text);
}
