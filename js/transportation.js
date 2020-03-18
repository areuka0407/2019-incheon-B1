let app;

class App {
    constructor(){
        this.init();
    }
    
    async init(){
        this.events = await this.getEvents();
    }

    
}

window.addEventListener("load", e => {
    app = new App();
});