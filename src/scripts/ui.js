import icPick from '../assets/ic-pick.svg';
import icSlide from '../assets/ic-slide.svg';
import icInfo from '../assets/ic-info.svg';
import keyboard from './keyboard';

function UiObject() {

    this.createCheckbox = (name, id, state, options) => {
        let checkboxContainer = document.createElement('label');
        checkboxContainer.classList.add('ui-checkbox');
        checkboxContainer.innerText = name;
        if(options && options.light) checkboxContainer.classList.add('bbg');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        if(state) checkbox.checked = 'checked';

        let checkmark = document.createElement('span');
        checkmark.classList.add('checkbox-mark');

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkmark);
        return checkboxContainer;
    }

    this.createButton = (name, id, icon, options) => {
        let button = document.createElement('button');
        button.classList.add('ui-button');

        let buttonText = document.createElement('span');
        buttonText.innerText = name;
        let buttonIcon = document.createElement('img');
        import(`../assets/${icon}`).then(({default: i}) => {
            buttonIcon.src = i;
        }).catch(() => {
            console.error('Cannot load asset');
        });
        

        if(options && options.light) button.classList.add('bbg');
        button.id = id;

        if(icon) button.appendChild(buttonIcon);
        button.appendChild(buttonText);
        return button;
    }

    this.createInput = (type, options) => {
        let inputContainer = document.createElement('div');
        inputContainer.classList.add('ui-input');
        if(options && options.light) checkboxContainer.classList.add('bbg');

        let input = document.createElement('input');
        input.type = type;
        input.id = options.id;
        if(options.placeholder) input.placeholder = options.placeholder;

        if(options.defaultValue) input.value = options.defaultValue();

        if(options.maxlength) input.maxLength = options.maxlength;
        if(options.minlength) input.minLength = options.minlength;

        if(options.max) input.max = options.max;
        if(options.min) input.min = options.min;

        inputContainer.appendChild(input);
        input.onchange = () => {
            options.onValueChange(input.value);
        }
        input.onfocus = () => inputContainer.classList.add('f');
        input.onblur = () => inputContainer.classList.remove('f');

        if(options.icon) {
            let inputIcon = document.createElement('img');
            inputIcon.draggable = false;
            let src;
            let pointer = "";
            switch (options.icon) {
                case 'pick':
                    src = icPick;
                    pointer = 'pointer';
                    break;
                case 'slide':
                    src = icSlide;
                    pointer = 'e-resize';
                    break;
                case 'info':
                    src = icInfo;
                    pointer = 'pointer';
                    break;
            }
            inputIcon.src = src || (type == 'number' ? icSlide : icInfo);
            inputIcon.style.cursor = pointer || (type == 'number' ? 'e-resize' : 'pointer');

            let click = true;
            if(options.onIconClick) {
                inputIcon.onclick = e => {
                    if(click) options.onIconClick(e);
                }
            }

            if(type == 'number' && !options.onIconDrag) {
                function isInteger() {
                    return options.integerOnly || (options.defaultToInteger && !keyboard.getKeys().includes(16));
                }
                let v;
                let p;
                function moveFunction(e) {
                    click = false;
                    v += e.movementX * (options.scale || 1);
                    let pv = isInteger() ? Math.round(v) : Math.round(v*100)/100;
                    //handle numbers after the decimal point
                    if(!isInteger()) {
                        let afterDecimal = pv.toString().split('.')[1];
                        if(!afterDecimal) pv = pv + '.00';
                        else if(afterDecimal.length < 2) pv += '0';
                    }
                    p.value = pv;
                }
                function stopFunction() {
                    p.value = isInteger() ? Math.round(v) : Math.round(v*100)/100;
                    document.removeEventListener('pointermove', moveFunction);
                    document.removeEventListener('pointerup', stopFunction);
                }

                inputIcon.onpointerdown = e => {
                    click = true;
                    p = e.target.parentElement.querySelector('input');
                    v = parseFloat(p.value);
                    document.addEventListener('pointermove', moveFunction);
                    document.addEventListener('pointerup', stopFunction);
                }
            }

            if(options.onIconDrag) {
                function moveFunction(e) {
                    click = false;
                    options.onIconDrag(e);
                }
                function stopFunction() {
                    document.removeEventListener('pointermove', moveFunction);
                    document.removeEventListener('pointerup', stopFunction);
                }

                inputIcon.onpointerdown = () => {
                    click = true;
                    document.addEventListener('pointermove', moveFunction);
                    document.addEventListener('pointerup', stopFunction);
                }
            }

            inputContainer.appendChild(inputIcon);
        }

        return inputContainer;
    }

}

let uiObject = new UiObject();

export default {
    createCheckbox: (name, id, state, options) => {
        return uiObject.createCheckbox(name, id, state, options);
    },

    renderUiObject: (obj, elem) => {
        function cycle(o, e) {
            let elementContainer = document.createElement('div');
            let p = o.properties;
            elementContainer.classList.add('ui-element');

            switch(o.properties.type) {
                case 'checkbox':
                    let checkboxElement = uiObject.createCheckbox(p.text, p.id, p.checked());
                    checkboxElement.getElementsByTagName('input')[0].onchange = () => {
                        let c = checkboxElement.getElementsByTagName('input')[0].checked;
                        p.onCheckChange(c);
                    }
                    elementContainer.appendChild(checkboxElement);
                    break;
                case 'button':
                    let buttonElement = uiObject.createButton(p.text, p.id, p.icon);
                    buttonElement.onclick = p.onClick;
                    elementContainer.appendChild(buttonElement);
                    break;
                case 'textInput':
                    let inputElement = uiObject.createInput('text', p);
                    elementContainer.appendChild(inputElement);
                    break;
                case 'numberInput':
                    let ninputElement = uiObject.createInput('number', p);
                    elementContainer.appendChild(ninputElement);
                    break;
            }

            e.appendChild(elementContainer);

            if(o.children) {
                o.children.forEach(c => {
                    cycle(c, elementContainer);
                });
            }
        }

        cycle(obj, elem);
    }
}

