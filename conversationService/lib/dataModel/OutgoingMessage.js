class OutgoingMessage {

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

}

module.exports = OutgoingMessage;
