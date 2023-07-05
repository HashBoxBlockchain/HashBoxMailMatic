"use strict";

class Help{
    constructor() {
        this.elementsToFindByScroll = null;
        this.listenEvents();
    }

    listenEvents() {
        const self = this;
        document.addEventListener("DOMContentLoaded", async function() {
            // Get all elements which have class findByScroll
            self.elementsToFindByScroll = Array.prototype.slice.call(document.getElementsByClassName("help"));

            // Map their ids to their positions so we can reference them later
            const positionsToIdsMap = self.elementsToFindByScroll.reduce(function(result, item) {
                const top = item.offsetTop - 100;//margin of 100px for links
                result[top] = item.id;
                return result;
            }, {});

            // When we scroll find which is the element we have scrolled past and log its id to console
            document.getElementsByClassName('container')[0].addEventListener("scroll", function () {
                const scrollValue = document.getElementsByClassName('container')[0].scrollTop;
                let elementId = undefined;

                const keys = Object.keys(positionsToIdsMap);
                for (let i = 0; i < keys.length; i++) {
                    if(i < keys.length - 1){
                        if (keys[i + 1] > scrollValue) {
                            elementId = positionsToIdsMap[keys[i]];
                            break;
                        }
                    }
                    else{
                        elementId = positionsToIdsMap[keys[keys.length - 1]];
                        break;
                    }
                }
                help.selectLink(elementId);
            });
        });
    }

    selectLink(elementId){
        for(let i=0;i<this.elementsToFindByScroll.length; i++){
            const id = this.elementsToFindByScroll[i].id;
            let fontWeight = "normal";
            if(id === elementId){
                fontWeight = "bold";
            }
            document.getElementsByClassName(id)[0].style.fontWeight = fontWeight;
        }
    }
}
const help = new Help();
export {help};