exports.getInstance = function(id)  {
    return new Message(id);
}

exports.MESSAGE_TYPES = {
    "text":"text",
    "quickReply":"quickReply",
    "postback":"postback",
    "attachment":"attachment",
    "unknown":"unknown"
}

class Message {

    constructor (id) {
        //id is just for debugging
        this.id = id;
        this.message = {};
    }

    getId() {
        return this.id;
    } 

    getVisitorId() {
        return this.message.visitorId;
    }

    setVisitorId(id) {
        this.message.visitorId = id;
    }

    getMessageType() {
        return this.message.type; 
    }

    setMessageType(type) {
        this.message.type = type;
    }

    getMessageContentType() {
        return this.message.contentType;
    }

    setMessageContentType(contentType) {
        this.message.contentType = contentType;
    }

    getMessageContent(content) {
        return this.message.content;
    }

    setMessageContent(content) {
        this.message.content = content;
    }

}