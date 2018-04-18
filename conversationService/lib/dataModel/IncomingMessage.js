

class VisitorMessage {

    constructor(id) {
        //id is just for debugging
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getVisitorId() {
        return this.visitorId;
    }

    setVisitorId(id) {
        this.visitorId = id;
        return this;
    }

    getMessageType() {
        return this.messageType;
    }

    setMessageType(type) {
        this.messageType = type;
        return this;
    }

    getMessageContentType() {
        return this.contentType;
    }

    setMessageContentType(contentType) {
        this.contentType = contentType;
        return this;
    }

    getMessageContent(messageContent) {
        return this.messageContent;
    }

    setMessageContent(messageContent) {
        this.messageContent = messageContent;
        return this;
    }

    getProvider() {
        return this.provider;
    }

    setProvider(provider) {
        this.provider = provider;
        return this;
    }

    getCustomerId() {
        return this.customerId;
    }

    setCustomerId(customerId) {
        this.customerId = customerId;
        return this;
    }

    getAction() {
        return this.action;
    }

    setAction(action) {
        this.action = action;
        return this;
    }

    getItemRef() {
        return this.itemRef;
    }

    setItemRef(itemRef) {
        this.itemRef = itemRef;
    }

}

module.exports = VisitorMessage;
