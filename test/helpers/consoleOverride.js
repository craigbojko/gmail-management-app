let write;
let log;
let output = '';
let suppressed = false;

export const suppressConsole = () => {
    write = process.stdout.write;
    log = console.log;
    process.stdout.write = console.log = (s) => {
        output += s;
    };
    suppressed = true;
};

export const restoreConsole = () => {
    process.stdout.write = write;
    console.log = log;
    suppressed = false;
};

export const printConsoleBuffer = () => {
    if (!suppressed) {
        return;
    }
    log(output);
};
