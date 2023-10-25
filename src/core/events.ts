const eventsNamespace = "edithEvents";
let eventsGuid = 0;

type EdithEvent = { type: string; ns: Array<string> | null; handler: EventListenerOrEventListenerObject };

type EdithEvents = {
  [key: string]: EdithEvent;
};

declare global {
  interface Window {
    edithEvents: EdithEvents;
  }
  interface Document {
    edithEvents: EdithEvents;
  }
  interface HTMLElement {
    edithEvents: EdithEvents;
  }
}

export enum Events {
  modeChanged = "edith-mode-changed",
  initialized = "edith-initialized",
}

/**
 * Parse an event type to separate the type & the namespace
 * @param {string} string
 */
function parseEventType(string: string): Omit<EdithEvent, "handler"> {
  const [type, ...nsArray] = string.split(".");
  return {
    type,
    ns: nsArray ?? null,
  };
}

/**
 * Set an event listener on the node.
 * @param {Window|Document|HTMLElement} node
 * @param {string} events
 * @param {Function} handler
 */
function addEventListener(
  node: Window | Document | HTMLElement,
  events: string,
  handler: EventListenerOrEventListenerObject
): void {
  if (node[eventsNamespace] === undefined) {
    node[eventsNamespace] = {};
  }

  for (const event of events.split(" ")) {
    const { type, ns } = parseEventType(event);
    const handlerGuid = (++eventsGuid).toString(10);
    node.addEventListener(type, handler);
    node[eventsNamespace][handlerGuid] = { type, ns, handler };
  }
}

/**
 * Remove event listeners from the node.
 * @param {Window|Document|HTMLElement} node
 * @param {string} events
 * @param {Function|undefined} handler
 */
function removeEventListener(
  node: Window | Document | HTMLElement,
  events: string,
  handler?: EventListenerOrEventListenerObject
): void {
  if (node[eventsNamespace] === undefined) {
    node[eventsNamespace] = {};
  }

  for (const event of events.split(" ")) {
    const { type, ns } = parseEventType(event);

    for (const [guid, handlerObj] of Object.entries(node[eventsNamespace])) {
      if (handlerObj.type !== type && type !== "*") {
        continue;
      }

      if (
        (ns === null || handlerObj.ns?.includes(ns[0])) &&
        (handler === undefined || (typeof handler === "function" && handler === handlerObj.handler))
      ) {
        delete node[eventsNamespace][guid];
        node.removeEventListener(handlerObj.type, handlerObj.handler);
      }
    }
  }
}

/**
 * Set an event listener on every node.
 * @param {Window|Document|HTMLElement|NodeList} nodes
 * @param {string} events
 * @param {Function} handler
 */
export function on(
  nodes: Window | Document | HTMLElement | NodeListOf<HTMLElement>,
  events: string,
  handler: EventListenerOrEventListenerObject
): void {
  if (nodes instanceof NodeList) {
    for (const node of nodes) {
      addEventListener(node, events, handler);
    }
  } else {
    addEventListener(nodes, events, handler);
  }
}

/**
 * Remove event listeners from the node.
 * @param {Window|Document|HTMLElement|NodeList} node
 * @param {string} events
 * @param {Function|undefined} handler
 */
export function off(
  nodes: Window | Document | HTMLElement | NodeListOf<HTMLElement>,
  events: string,
  handler?: EventListenerOrEventListenerObject
): void {
  if (nodes instanceof NodeList) {
    for (const node of nodes) {
      removeEventListener(node, events, handler);
    }
  } else {
    removeEventListener(nodes, events, handler);
  }
}

/**
 * Trigger the EdithEvent on the node.
 * @param {Window|Document|HTMLElement} node
 * @param {string} event
 * @param {Object|undefined} payload
 */
export function trigger(
  node: Window | Document | HTMLElement,
  event: string,
  payload?: { [key: string]: unknown }
): void {
  node.dispatchEvent(new CustomEvent(event, { detail: payload }));
}
