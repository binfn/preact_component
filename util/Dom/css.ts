/// <reference lib="dom" />
// deno-lint-ignore-file no-explicit-any
const PIXEL_PATTERN = /margin|padding|width|height|max|min|offset/;

const removePixel:Record<string, any>= {
  left: true,
  top: true,
};
const floatMap:Record<string, any>= {
  cssFloat: 1,
  styleFloat: 1,
  float: 1,
};

function getComputedStyle(node:Element) : Record<string,any>{
  return node.nodeType === 1 ?
    (node.ownerDocument.defaultView?.getComputedStyle(node, null)??{}) : {};
}

function getStyleValue(node:HTMLElement, type:string, value:any) {
  type = type.toLowerCase();
  if (value === 'auto') {
    if (type === 'height') {
      return node.offsetHeight;
    }
    if (type === 'width') {
      return node.offsetWidth;
    }
  }
  if (!(type in removePixel)) {
    removePixel[type] = PIXEL_PATTERN.test(type);
  }
  return removePixel[type] ? (parseFloat(value) || 0) : value;
}

export function get(node:HTMLElement, name:string) {
  const length = arguments.length;
  const style = getComputedStyle(node);

  name = floatMap[name] ? 'cssFloat' in node.style ? 'cssFloat' : 'styleFloat' : name;

  //@ts-ignore original
  return (length === 1) ? style : getStyleValue(node, name, style[name] || node.style[name]);
}

export function set(node:any, name:any, value:any) {
  const length = arguments.length;
  name = floatMap[name] ? 'cssFloat' in node.style ? 'cssFloat' : 'styleFloat' : name;
  if (length === 3) {
    if (typeof value === 'number' && PIXEL_PATTERN.test(name)) {
      value = `${value}px`;
    }
    node.style[name] = value; // Number
    return value;
  }
  for (const x in name) {
    if (name.hasOwnProperty(x)) {
      set(node, x, name[x]);
    }
  }
  return getComputedStyle(node);
}

export function getOuterWidth(el:any) {
  if (el === document.body) {
    return document.documentElement.clientWidth;
  }
  return el.offsetWidth;
}

export function getOuterHeight(el:any) {
  if (el === document.body) {
    return window.innerHeight || document.documentElement.clientHeight;
  }
  return el.offsetHeight;
}

export function getDocSize() {
  const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

  return {
    width,
    height,
  };
}

export function getClientSize() {
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;
  return {
    width,
    height,
  };
}

export function getScroll() {
  return {
    scrollLeft: Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
    scrollTop: Math.max(document.documentElement.scrollTop, document.body.scrollTop),
  };
}

export function getOffset(node:any) {
  const box = node.getBoundingClientRect();
  const docElem = document.documentElement;

  // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
  return {
    left: box.left + (window.pageXOffset || docElem.scrollLeft) -
      (docElem.clientLeft || document.body.clientLeft || 0),
    top: box.top + (window.pageYOffset || docElem.scrollTop) -
      (docElem.clientTop || document.body.clientTop || 0),
  };
}
