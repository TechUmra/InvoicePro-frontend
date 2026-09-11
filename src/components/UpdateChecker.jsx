import { useEffect, useState } from "react";
import { APP_VERSION } from "../config/version";

const VERSION_URL =
    "https://raw.githubusercontent.com/TechUmra/InvoicePro-frontend/main/version.json";

const isNewerVersion = (remoteVersion, currentVersion) => {
    const remote = remoteVersion.split(".").map(Number);
    const current = currentVersion.split(".").map(Number);

    for (
        let i = 0;
        i < Math.max(remote.length, current.length);
        i++
    ) {
        const remotePart = remote[i] || 0;
        const currentPart = current[i] || 0;

        if (remotePart > currentPart) {
            return true;
        }

        if (remotePart < currentPart) {
            return false;
        }
    }

    return false;
};

function UpdateChecker() {
    const [update, setUpdate] = useState(null);

    useEffect(() => {
        const checkForUpdate = async () => {
            try {
                const response = await fetch(
                    `${VERSION_URL}?t=${Date.now()}`
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (
                    data.version &&
                    isNewerVersion(
                        data.version,
                        APP_VERSION
                    )
                ) {
                    setUpdate(data);
                }
            } catch (error) {
                console.log(
                    "Update check failed:",
                    error
                );
            }
        };

        checkForUpdate();
    }, []);

    if (!update) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

                <h2 className="text-2xl font-bold text-slate-800">
                    New Update Available 🚀
                </h2>

                <p className="mt-3 text-slate-600">
                    A new version of InvoicePro is available.
                </p>

                {update.message && (
                    <p className="mt-2 text-sm text-slate-500">
                        {update.message}
                    </p>
                )}

                <div className="mt-6 flex gap-3">

                    <button
                        type="button"
                        onClick={() => setUpdate(null)}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-600"
                    >
                        Later
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            window.location.href =
                                update.apkUrl;
                        }}
                        className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white"
                    >
                        Update Now
                    </button>

                </div>

            </div>

        </div>
    );
}

export default UpdateChecker;