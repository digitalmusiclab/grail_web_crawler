'use strict';

/*
    Sleep

    Pauses thread execution for a specified time in ms;

    @param { integer } ms - time in milliseconds to sleep

    @return { promise } A promise that is resolved after sleeping.
*/
exports = module.exports = function sleep(ms) {

    // Parse base 10 integer 
    const time = Number.parseInt(ms, 10);
    
    // Ensure time is non-negative
    const sleepTime = Math.max(time, 0);

    return new Promise( resolve => setTimeout(resolve, sleepTime));
}