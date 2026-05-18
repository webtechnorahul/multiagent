import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {

    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                sandboxId: sandboxId,
                app:'sandbox'
            }
        },
        spec: {
            containers: [
                {
                    name: `sandbox-container`,
                    image: "tamplate",
                    imagePullPolicy: "IfNotPresent",
                    ports: [
                        {
                            containerPort: 5173,
                            name:'http'
                        }
                    ],
                    resources:{
                        limits:{
                            cpu:'500m',
                            memory:'128Mi'
                        },
                        requests:{
                            cpu:'250m',
                            memory:'64Mi'
                        }
                    }
                }
            ]
        }
    };

    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace: 'default',
        body: podManifest
    });
    return response;

}