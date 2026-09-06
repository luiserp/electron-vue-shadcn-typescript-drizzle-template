import { registerApplicationIpc } from "./ipc";
import { createApplication } from "./container";

export async function bootstrap() {
    
    const app = await createApplication();

    registerApplicationIpc(app); 
}
