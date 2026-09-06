import { AppDb, initDatabase } from "../infrastructure/database";

export type Module = {
    name: string;
    register: (application: Application) => void;
    boot: (application: Application) => Promise<void>;
}

export type ModuleFactory = (application: Application) => Module

const discoveredModules = import.meta.glob<{ createModule: ModuleFactory }>(
    '../modules/*/module.ts',
    { eager: true }
)

export class Application {
    
    private readonly db: AppDb;
    private readonly modules: Module[];

    constructor(db: AppDb, modules: Module[] = []) {
        this.db = db;
        this.modules = modules;
    }

    public getDb() {
        return this.db;
    }

    public getModules(): Module[] {
        return this.modules;
    }

    public addModule(module: Module) {
        this.modules.push(module);
    }
}

export async function createApplication() {
    // Initialize the database
    const db = await initDatabase()

    const application = new Application(db);

    // Add modules to the application
    createModules(application);

    // Register the modules
    registerModules(application);

    // Boot the modules
    await bootModules(application);

    return application;
}

function createModules(application: Application) {
    for (const [path, mod] of Object.entries(discoveredModules)) {
        if (typeof mod.createModule !== 'function') {
            throw new Error(`Module at ${path} must export createModule(application)`)
        }
        application.addModule(mod.createModule(application))
    }
}

function registerModules(application: Application) {
   for (const module of application.getModules()) {
        module.register(application);
   }
}

async function bootModules(application: Application) {
    for (const module of application.getModules()) {
        await module.boot(application);
    }
}
