export function getInstance() {
    return new Order();
}

class Order {

    constructor (id) {
        this.id = id;    
        this.items = {};
    }

    get id() {
        return this.id;
    }

    addItem() {

    }

    removeItem() {
        
    }
}