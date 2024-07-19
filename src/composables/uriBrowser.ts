export default function useUriBrowser(uri: string): void {
    window.backendAPI.openUriBrowser(uri);
}