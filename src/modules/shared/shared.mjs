"use strict";

import {utils} from "../utils/utils.mjs";
import {Constants} from "./constants.mjs";

class Shared{

    constructor() {
        this.showedAlert = false;
    }

    showToast(message, index){
        index = index ? index : 0;
        if(document.getElementsByClassName('toast-body')[index]){
            document.getElementsByClassName("toast")[index].classList.remove("d-none");
            document.getElementsByClassName("toast")[index].classList.remove("none");
            document.getElementsByClassName('toast-body')[index].innerHTML = message;
            Array.from(document.querySelectorAll('.custom-toast'))
                .forEach(toastNode => new bootstrap.Toast(toastNode).show());
        }
    }

    showWarning(title, text, lastText, link, address) {
        if(title && text && lastText){
            document.getElementsByClassName("custom-title-warning")[0].innerHTML = title;
            document.getElementsByClassName("custom-text-warning")[0].innerHTML = text;
            document.getElementsByClassName("custom-text-warning")[1].innerHTML = lastText;
        }
        if(link){
            document.getElementsByClassName("custom-text-warning")[1].href = link;
        }
        else if(!link && !address){
            document.getElementsByClassName("custom-text-warning")[1].style.textDecoration = "none";
            document.getElementsByClassName("custom-text-warning")[1].style.pointerEvents = "none";
        }
        else{
            this.hideClassName("custom-text-warning", 1);
            this.showClassName("custom-btn-warning", 0);
            document.getElementsByClassName("custom-btn-warning")[0].innerHTML = lastText;
            document.getElementsByClassName('custom-btn-warning')[0].addEventListener('click', () => {
                this.hideWarning();
            });
        }
        this.showClassName("warning-background", 0);
        this.showClassName("custom-dialog-warning-large", 0);
        this.hideLoading();
    }

    hideWarning(){
        this.hideClassName("warning-background", 0);
        this.hideClassName("custom-dialog-warning-large", 0);
    }

    showClassName(className, index){
        document.getElementsByClassName(className)[index].classList.remove("d-none");
        document.getElementsByClassName(className)[index].style.display = "d-block";
        document.getElementsByClassName(className)[index].classList.remove("none");
        document.getElementsByClassName(className)[index].style.display = "block";
        document.getElementsByClassName(className)[index].classList.remove("invisible");
    }

    hideClassName(className, index){
        document.getElementsByClassName(className)[index].classList.remove("d-block");
        document.getElementsByClassName(className)[index].style.display = "d-none";
        document.getElementsByClassName(className)[index].classList.remove("block");
        document.getElementsByClassName(className)[index].style.display = "none";
        document.getElementsByClassName(className)[index].classList.add("invisible");
    }

    showLoading(){
        if(document.getElementsByClassName("custom-spinner").length > 0){
            document.getElementsByClassName("custom-spinner")[0].style.display = "block";
            document.getElementById("spinner-back").classList.add("show");
            document.getElementById("spinner-front").classList.add("show");
        }
    }

    hideLoading(){
        if(document.getElementsByClassName("custom-spinner").length > 0){
            document.getElementsByClassName("custom-spinner")[0].style.display = "none";
            document.getElementById("spinner-back").classList.remove("show");
            document.getElementById("spinner-front").classList.remove("show");
        }
    }

    clicks(){}

    unselect(listName, boldItem, color){
        const list = document.getElementsByClassName(listName)[0].getElementsByTagName("li");
        for(let i=0;i<list.length;i++){
            const item = list[i];
            const child = item.children[0];
            if(!child.className.includes(boldItem)){
                child.classList.remove("fw-bold");
                child.style.backgroundColor = color;
            }
        }
    }

    select(listName, boldItem, color){
        const list = document.getElementsByClassName(listName)[0].getElementsByTagName("li");
        for(let i=0;i<list.length;i++){
            const item = list[i];
            const child = item.children[0];
            if(child.className.includes(boldItem)){
                child.classList.add("fw-bold");
                child.style.backgroundColor = color;
            }
        }
    }

    disableAll(disableCompose){
        utils.disableButton("block-all", 0);
        utils.disableButton("delete-all", 0);
        utils.disableButton("read-all", 0);
        utils.disableButton("refresh", 0);
        utils.disableButton("page-back", 0);
        utils.disableButton("page-forward", 0);
        document.getElementsByClassName('options-list')[0].style.pointerEvents = "none";
        shared.unselect("options-list","null", "#e7e7ff");
        shared.setText("options-list", "grey");
        if(disableCompose){
            document.getElementsByClassName("compose")[0].disabled = true;
        }
    }

    enableAll(enableCompose){
        utils.enableButton("block-all", 0);
        utils.enableButton("delete-all", 0);
        utils.enableButton("read-all", 0);
        utils.enableButton("refresh", 0);
        utils.enableButton("page-back", 0);
        utils.enableButton("page-forward", 0);
        document.getElementsByClassName('options-list')[0].style.pointerEvents = "all";
        shared.select("options-list","inbox", "#bcb2ff");
        shared.setText("options-list", "black");
        if(enableCompose){
            document.getElementsByClassName("compose")[0].disabled = false;
        }
    }

    setText(listName, color){
        const list = document.getElementsByClassName(listName)[0].getElementsByTagName("li");
        for(let i=0;i<list.length;i++){
            const item = list[i];
            const child = item.children[0];
            child.style.color = color;
        }
    }

    getWei(value, web3){
        if(utils.countDecimals(value) <= Constants.TOTAL_DECIMALS_EVM){
            return web3.utils.toWei(value.toString(), "ether");
        }
        utils.showAlert("Error: too many decimal places.");
        return false;
    }
}
const shared = new Shared();
export {shared};