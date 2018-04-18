export function getInstance(id) {
    return new Order(id);
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