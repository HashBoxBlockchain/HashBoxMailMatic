"use strict";

class SharedOld{
    getWeb3(){
        !localStorage.getItem("providerLink") ? localStorage.setItem("providerLink", "https://rinkeby.infura.io/v3/f3e2ba954dd6423b8c163a5640ae5c21") : undefined;
        return new Web3(localStorage.getItem("providerLink"));
    }

    showId(id){
        document.getElementById(id).classList.remove("d-none");
        document.getElementById(id).style.display = "d-block";
        document.getElementById(id).classList.remove("none");
        document.getElementById(id).style.display = "block";
        document.getElementById(id).classList.remove("invisible");
    }

    hideId(id){
        document.getElementById(id).classList.remove("d-block");
        document.getElementById(id).style.display = "d-none";
        document.getElementById(id).classList.remove("block");
        document.getElementById(id).style.display = "none";
        document.getElementById(id).classList.add("invisible");
    }

    async savePendingTx(info, block, network){
        const web3 = this.getWeb3();
        const data = {
            contract: info.contract,
            id: info.id,
            address: info.address,
            nonce: await web3.eth.getTransactionCount(info.address),
            block: block,
            network: network,
        }
        localStorage.setItem("pendingTx_"+info.address, JSON.stringify(data));
    }

    getPendingTx(address){
        const info = localStorage.getItem("pendingTx_"+address);
        return info ? JSON.parse(info) : null;
    }

    removePendingTx(address){
        localStorage.removeItem("pendingTx_"+address);
    }

    showMenu(){
        document.getElementsByClassName("menu-nav")[0].classList.remove("invisible");
        document.getElementsByClassName("menu-nav-background")[0].classList.remove("invisible");
    }

    hideMenu(){
        document.getElementsByClassName("menu-nav")[0].classList.add("invisible");
        document.getElementsByClassName("menu-nav-background")[0].classList.add("invisible");
    }

    setConnected(address, addressMaxLength, hide){
        const headerMenu = document.getElementById("header-menu");
        if(hide){
            this.hideId("header-menu");
        }
        else{
            const addressWithEllipsis = this.getEllipsis(address, addressMaxLength);
            if(address){
                headerMenu.style.color = "#00e676"
                headerMenu.innerHTML = "Connected as \n"+addressWithEllipsis;
            }
            else{
                headerMenu.style.color = "#ff1744"
                headerMenu.innerHTML  = "User not Connected";
            }
        }
    }
}
const sharedOld = new SharedOld();
export {sharedOld};