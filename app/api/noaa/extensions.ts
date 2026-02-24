

    declare global {
        interface String {
            empty(): string
        }
    }

    String.prototype.empty = function () {
        return String().valueOf();
    };


export {};
