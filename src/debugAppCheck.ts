import { getToken, AppCheck } from "firebase/app-check";

export const debugAppCheckToken = async (appCheckInstance: AppCheck) => {
    console.log("🕵️ Starting App Check Token Diagnodics...");

    try {
        const tokenResult = await getToken(appCheckInstance, false);
        const token = tokenResult.token;

        console.log("🎟️ raw token:", token);

        // Decode JWT payload (without validation)
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
            const normalizedBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(normalizedBase64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const claims = JSON.parse(jsonPayload);
            console.log("🔓 Decoded Token Claims:", claims);

            console.log("---------------------------------------------------");
            console.log(`✅ Token Project ID (aud): ${claims.aud}`); // Should contain 'luach-web'
            console.log(`✅ Token App ID (sub):     ${claims.sub}`); // Should match '1:265711408278:web:...'
            console.log(`✅ Expiration:             ${new Date(claims.exp * 1000).toLocaleString()}`);
            console.log("---------------------------------------------------");

            if (!claims.aud.includes("luach-web")) {
                console.error("❌ MISMATCH: Token is for project '" + claims.aud[0] + "', but you are connecting to 'luach-web'!");
            }
            if (claims.sub !== "1:265711408278:web:f32215478c1e2277581eb7") {
                console.error("❌ MISMATCH: Token App ID does not match your firebase.ts config!");
            }
        }
    } catch (e) {
        console.error("❌ Error getting/decoding token:", e);
    }
};
