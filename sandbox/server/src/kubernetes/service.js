import { k8sCoreV1Api } from "./config.js";

export const createService = async (sandboxId) => {
    const serviceManifest = {
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            labels:{
                name: `sandbox-service-${sandboxId}`,
                app: 'sandbox',
            }
        },
        spec: {
            selector: {
                sandboxId: sandboxId,
                app: 'sandbox'
            },
            ports: [
                {
                    port: 80,
                    targetPort: 5173,
                    name: 'http'
                }
            ],
            type: 'ClusterIP'
        }
    };

    const response = await k8sCoreV1Api.createNamespacedService({
        namespace: 'default',
        body: serviceManifest
    });

    return response;
};