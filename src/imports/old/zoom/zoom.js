"use strict";

//https://www.demo2s.com/javascript/javascript-canvas-zooming-in-html5-mobile.html

export class Zoom{
    constructor() {
        this.zoomState = {
            canvas: null,
            ctx :null,
            img: null
        }
    }

    startZoom(canvasId, url){
        this.zoomState = {...this.zoomState, canvas: document.getElementById(canvasId)};
        this.zoomState.canvas.width = window.innerWidth;
        this.zoomState.canvas.height = window.innerHeight;
        this.zoomState = {...this.zoomState, ctx: this.zoomState.canvas.getContext('2d')};
        this.trackTransforms(this.zoomState.ctx);

        this.zoomState = {...this.zoomState, img: new Image};
        this.zoomState.img.src = url;
        this.zoomState.img.addEventListener("load" , this.redraw , false);

        let lastX=this.zoomState.canvas.width/2, lastY=this.zoomState.canvas.height/2;
        let dragStart,dragged;
        this.zoomState.canvas.addEventListener('mousedown',function(evt){
            document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
            lastX = evt.offsetX || (evt.pageX - zoom.zoomState.canvas.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - zoom.zoomState.canvas.offsetTop);
            dragStart = zoom.zoomState.ctx.transformedPoint(lastX,lastY);
            dragged = false;
        },false);
        this.zoomState.canvas.addEventListener('mousemove',function(evt){
            lastX = evt.offsetX || (evt.pageX - zoom.zoomState.canvas.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - zoom.zoomState.canvas.offsetTop);
            dragged = true;
            if (dragStart){
                const pt = zoom.zoomState.ctx.transformedPoint(lastX,lastY);
                zoom.zoomState.ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
                zoom.redraw();
            }
        },false);
        this.zoomState.canvas.addEventListener('mouseup',function(evt){
            dragStart = null;
            if (!dragged) zoom_(evt.shiftKey ? -1 : 1 );
        },false);

        let scaleFactor = 1.1;
        let zoom_ = function(clicks){
            const pt = zoom.zoomState.ctx.transformedPoint(lastX,lastY);
            zoom.zoomState.ctx.translate(pt.x,pt.y);
            const factor = Math.pow(scaleFactor,clicks);
            zoom.zoomState.ctx.scale(factor,factor);
            zoom.zoomState.ctx.translate(-pt.x,-pt.y);
            zoom.redraw();
        }

        let handleScroll = function(evt){
            const delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
            if (delta) zoom_(delta);
            return evt.preventDefault() && false;
        };
        this.zoomState.canvas.addEventListener('DOMMouseScroll',handleScroll,false);
        this.zoomState.canvas.addEventListener('mousewheel',handleScroll,false);
    }

    trackTransforms(ctx){
        const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        let xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };

        const savedTransforms = [];
        const save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        let restore = ctx.restore;
        ctx.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };
        let scale = ctx.scale;
        ctx.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(ctx,sx,sy);
        };
        let rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(ctx,radians);
        };
        let translate = ctx.translate;
        ctx.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        let transform = ctx.transform;
        ctx.transform = function(a,b,c,d,e,f){
            const m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(ctx,a,b,c,d,e,f);
        };
        let setTransform = ctx.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx,a,b,c,d,e,f);
        };
        let pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
    }

    redraw(){
        const p1 = zoom.zoomState.ctx.transformedPoint(0,0);
        const p2 = zoom.zoomState.ctx.transformedPoint(zoom.zoomState.canvas.width,zoom.zoomState.canvas.height);
        zoom.zoomState.ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
        zoom.drawImageScaled(zoom.zoomState.img, zoom.zoomState.ctx);
    }

    drawImageScaled(img, ctx) {
        const canvas = ctx.canvas;
        const hRatio = canvas.width  / img.width;
        const vRatio =  canvas.height / img.height;
        const ratio  = Math.min ( hRatio, vRatio );
        const centerX = ( canvas.width - img.width*ratio ) / 2;
        const centerY = ( canvas.height - img.height*ratio ) / 2;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.drawImage(img, 0,0, img.width, img.height,
            centerX, centerY,img.width*ratio, img.height*ratio);
    }
}
export const zoom = new Zoom();


