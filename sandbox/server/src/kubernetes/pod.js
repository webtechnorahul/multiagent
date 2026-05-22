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
            volumes: [
                {
                    name:'workspace-volume',
                    emptyDir:{}
                }
            ],
            initContainers:[
                {
                    name:'init-container',
                    image:"tamplate",
                    imagePullPolicy:"IfNotPresent",
                    command:["sh","-c","cp -r /workspace/. /seed/"],
                    volumeMounts:[
                        {
                            name:'workspace-volume',
                            mountPath:'/seed'
                        }
                    ]
                }
            ],
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
                            memory:'512Mi'
                        },
                        requests:{
                            cpu:'250m',
                            memory:'250Mi'
                        }
                    },
                    volumeMounts:[
                        {
                            name:'workspace-volume',
                            mountPath:'/workspace'
                        }
                    ]
                },{
                    name:'sandbox-agent',
                    image:"agent",
                    imagePullPolicy:"IfNotPresent",
                    ports:[
                        {
                            containerPort:3000,
                            name:'http'
                        }
                    ],
                resources:{
                    limits:{
                        cpu:'500m',
                        memory:'512Mi'
                    },
                    requests:{
                        cpu:'250m',
                        memory:'250Mi'
                    }
                },
                volumeMounts:[
                    {
                        name:'workspace-volume',
                        mountPath:'/workspace'
                    }
                ]
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