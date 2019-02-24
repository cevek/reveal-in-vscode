import * as React from 'react';
const weakMap = new WeakMap();
// console.log(weakMap);
const origCreateElement = React.createElement;
(React as any).createElement = function(tag: any, props: any, ...children: any) {
    let fileName;
    if (props !== null && typeof props === 'object') {
        fileName = props[Names.filenameProp];
        props[Names.filenameProp] = undefined;
    }
    const vdom = origCreateElement(tag, props, ...children);
    weakMap.set(vdom.props, fileName);
    return vdom;
};

let inited = false;
export function init() {
    if (typeof window !== 'object') return;
    if (inited) return;
    inited = true;
    const select = document.createElement('div');
    select.style.cssText = `
		position: absolute;
		background: rgba(0,0,200,0.3);
		will-change: transform;
		display: none;
		transform-origin: 0 0;
		top: 0;
		left: 0;
		width: 100px;
		height: 100px;
	`;
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 20px;
		height: 20px;
		cursor: pointer;
		background: url(#bridgeCursorIcon);
	`;
    div.innerHTML = svg;
    // document.body.appendChild(div);
    document.body.appendChild(select);
    // let isSelecting = false;
    div.addEventListener('mouseup', e => {
        e.stopPropagation();
    });
    div.addEventListener('click', activate);
    document.body.addEventListener('keypress', e => {
        if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
            activate();
        }
    });

    function activate() {
        // isSelecting = true;
        select.style.display = 'block';
        let activeEl: Element | undefined;
        function mouseMove(e: MouseEvent) {
            const els = document.elementsFromPoint(e.x, e.y).filter(el => el !== select);
            const el = els[0];
            if (el !== undefined) {
                if (activeEl !== el) {
                    const rect = el.getBoundingClientRect();
                    select.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${rect.width /
                        100}, ${rect.height / 100})`;
                }
                activeEl = el;
            }
        }
        function mouseUp() {
            select.style.display = 'none';
            document.body.removeEventListener('mousemove', mouseMove);
            if (activeEl) {
                const key = Object.keys(activeEl).find(k => !!k.match(/^__reactInternalInstance/));
                if (key) {
                    const fileName = weakMap.get((activeEl as any)[key].pendingProps);
                    if (fileName) {
                        location.href = 'vscode://file/' + fileName;
                        // window.open('vscode://file/' + fileName);
                    }
                }
            }
        }
        document.body.addEventListener('mousemove', mouseMove);
        document.body.addEventListener('mouseup', mouseUp, { once: true });
    }
}

const svg = `
<svg version="1.1" id="bridgeCursorIcon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 297 297" xml:space="preserve">
	<path d="M294.077,251.199l-59.104-59.106l42.166-24.357c3.295-1.904,5.213-5.521,4.938-9.316c-0.273-3.796-2.69-7.101-6.225-8.51
		L87.82,74.905c-3.687-1.472-7.895-0.605-10.702,2.201c-2.807,2.808-3.674,7.016-2.203,10.702l74.994,188.053
		c1.41,3.534,4.715,5.952,8.511,6.226c3.796,0.276,7.413-1.643,9.316-4.939l24.353-42.166l59.102,59.107
		c1.862,1.864,4.389,2.91,7.023,2.91c2.634,0,5.16-1.046,7.022-2.91l28.841-28.844C297.956,261.366,297.956,255.078,294.077,251.199
		z M258.214,273.022l-61.229-61.235c-1.876-1.876-4.407-2.91-7.023-2.91c-0.43,0-0.864,0.028-1.295,0.085
		c-3.063,0.402-5.763,2.206-7.306,4.881l-20.584,35.642l-58.849-147.564l147.549,58.857l-35.645,20.588
		c-2.674,1.543-4.478,4.243-4.88,7.306c-0.403,3.06,0.64,6.134,2.824,8.318l61.232,61.235L258.214,273.022z"/>
	<path d="M43.611,29.552c-3.88-3.876-10.166-3.876-14.048,0c-3.879,3.88-3.879,10.168,0,14.048l22.069,22.069
		c1.939,1.938,4.482,2.909,7.024,2.909c2.541,0,5.082-0.971,7.023-2.909c3.878-3.879,3.878-10.168,0-14.047L43.611,29.552z"/>
	<path d="M51.089,98.215c0-5.485-4.448-9.931-9.933-9.931H9.946c-5.484,0-9.933,4.445-9.933,9.931c0,5.484,4.448,9.932,9.933,9.932
		h31.21C46.641,108.146,51.089,103.699,51.089,98.215z"/>
	<path d="M47.063,128.87l-22.071,22.071c-3.88,3.877-3.88,10.166,0,14.045c1.939,1.939,4.479,2.909,7.023,2.909
		c2.541,0,5.082-0.97,7.021-2.909l22.072-22.07c3.879-3.878,3.879-10.168,0-14.046C57.231,124.992,50.943,124.992,47.063,128.87z"/>
	<path d="M98.222,51.078c5.484,0,9.932-4.448,9.932-9.933V9.932c0-5.484-4.447-9.932-9.932-9.932c-5.485,0-9.931,4.447-9.931,9.932
		v31.214C88.291,46.63,92.736,51.078,98.222,51.078z"/>
	<path d="M135.893,64.005c2.544,0,5.085-0.968,7.024-2.908l22.068-22.069c3.88-3.879,3.88-10.168,0-14.046
		c-3.878-3.879-10.169-3.879-14.045,0l-22.069,22.069c-3.879,3.878-3.879,10.168,0,14.046
		C130.81,63.037,133.352,64.005,135.893,64.005z"/>
</svg>
`;
init();
