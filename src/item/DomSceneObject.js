/*
 * Paper.js - The Swiss Army Knife of Vector Graphics Scripting.
 * http://paperjs.org/
 *
 * Copyright (c) 2011 - 2014, Juerg Lehni & Jonathan Puckey
 * http://scratchdisk.com/ & http://jonathanpuckey.com/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

/**
 * @name DomSceneObject
 *
 * @class The Raster item represents an image in a Paper.js project.
 *
 * @extends Base
 */
var DomSceneObject = Item.extend(/** @lends DomSceneObject */{
    statics: {
        allDomSceneObjects: [],

        updateCoords: function(zoomFactor, objects) {
            objects = objects || DomSceneObject.allDomSceneObjects;
            for (var i = 0; i < objects.length; i++) {
                var item = objects[i],
                    node = item.node,
                    _y = item.y,
                    _x = item.x,
                    _shiftX = 0,
                    _shiftY = 0,
                    center = node.boundsCenter;
                if (center) {
                    _x = center.x;
                    _y = center.y;
                    _shiftX = item.node.clientWidth / 2;
                    _shiftY = item.node.clientHeight / 2;
                }

                var newCoords = item.canvasToDom(_x, _y);
                item.node.style.left = newCoords.x - _shiftX + 'px';
                item.node.style.top = newCoords.y - _shiftY + 'px';
            }
        }
    },

    _class: 'DomSceneObject',
    _serializeFields: {
    },

    initialize: function Item(x, y, center) {
        this._id = Item._id = (Item._id || 0) + 1;
        if (!this._project) {
            var project = paper.project,
                layer = project.activeLayer;
            this._setProject(project);
        }

        if (!DomSceneObject.initialized) {
            this._project.view.on('zoom', DomSceneObject.updateCoords);
            this._project.view.on('scroll', DomSceneObject.updateCoords);
            DomSceneObject.initialized = true;
        }

        this.x = x || 0;
        this.y = y || 0;

        this.node = document.createElement('div');
        this.node.style.position = 'absolute';
        var coord = this.canvasToDom(x, y);
        this.node.style.left = coord.x + 'px';
        this.node.style.top = coord.y + 'px';
        this.node.className = "sticker-dom-obj";
        DomSceneObject.allDomSceneObjects.push(this);
        this._project.view._element.parentNode.style.position = 'relative';
        this._project.view._element.parentNode.style.padding = '0';
        this._project.view._element.parentNode.style.margin = '0';
        this._project.view._element.parentNode.appendChild(this.node);
        this.node.boundsCenter = center;
    },
    removeChild: function(node){
        this.node.removeChild(node);
    },
    appendChild: function(node){
        this.node.appendChild(node);
    },
    remove: function(){
        for (var i = 0; i < DomSceneObject.allDomSceneObjects.length; i++){
            if (DomSceneObject.allDomSceneObjects[i] === this){
                DomSceneObject.allDomSceneObjects.splice(i, i + 1);
            }
        }
        this._project.view._element.parentNode.removeChild(this.node);
        if (DomSceneObject.allDomSceneObjects.length === 0) {
            this._project.view.detach('zoom', DomSceneObject.updateCoords);
            this._project.view.detach('scroll', DomSceneObject.updateCoords);
            DomSceneObject.initialized = false;
        }
    },
    canvasToDom: function(x, y) {
        var matrix = this._project.view._matrix,
            newX = (matrix._tx + x * matrix._a),
            newY = (matrix._ty + y * matrix._a);

        return {x: newX, y: newY};
    },
    data: {},
    set: function(props) {
        if (props)
            this._set(props);
        return this;
    },
    _setProject: function(project) {
        if (this._project != project) {
            this._project = project;
            if (this._children) {
                for (var i = 0, l = this._children.length; i < l; i++) {
                    this._children[i]._setProject(project);
                }
            }
        }
    },
    getId: function() {
        return this._id;
    },
    getType: function() {
        return this._type;
    },

    getName: function() {
        return this._name;
    },

    setName: function(name, unique) {
        if (this._name)
            this._removeFromNamed();
        if (name && this._parent) {
            var children = this._parent._children,
                namedChildren = this._parent._namedChildren,
                orig = name,
                i = 1;
            while (unique && children[name])
                name = orig + ' ' + (i++);
            (namedChildren[name] = namedChildren[name] || []).push(this);
            children[name] = this;
        }
        this._name = name || undefined;
        this._changed(32);
    }

});
