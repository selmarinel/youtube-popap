let Modal = (function() {
    let trigger = $qsa('.modal__trigger'); // what you click to activate the modal
    let modals = $qsa('.modal'); // the entire modal (takes up entire window)
    let modalsbg = $qsa('.modal__bg'); // the entire modal (takes up entire window)
    let content = $qsa('.modal__content'); // the inner content of the modal
    let closers = $qsa('.modal__close'); // an element used to close the modal
    let w = window;
    let isOpen = false;
    let contentDelay = 400; // duration after you click the button and wait for the content to show
    let len = trigger.length;

    // make it easier for yourself by not having to type as much to select an element
    function $qsa(el) {
        return document.querySelectorAll(el);
    }

    let getId = function(event) {
        event.preventDefault();
        let self = this;
        // get the value of the data-modal attribute from the button
        let modalId = self.dataset.modal;
        let len = modalId.length;
        // remove the '#' from the string
        let modalIdTrimmed = modalId.substring(1, len);
        // select the modal we want to activate
        let modal = document.getElementById(modalIdTrimmed);
        // execute function that creates the temporary expanding div
        makeDiv(self, modal);
    };

    let makeDiv = function(self, modal) {

        let fakediv = document.getElementById('modal__temp');

        /**
         * if there isn't a 'fakediv', create one and append it to the button that was
         * clicked. after that execute the function 'moveTrig' which handles the animations.
         */

        if (fakediv === null) {
            let div = document.createElement('div');
            div.id = 'modal__temp';
            self.appendChild(div);
            moveTrig(self, modal, div);
        }
    };

    let moveTrig = function(trig, modal, div) {
        let trigProps = trig.getBoundingClientRect();
        let m = modal;
        let mProps = m.querySelector('.modal__content').getBoundingClientRect();
        let transX, transY, scaleX, scaleY;
        let xc = w.innerWidth / 2;
        let yc = w.innerHeight / 2;

        // this class increases z-index value so the button goes overtop the other buttons
        trig.classList.add('modal__trigger--active');

        // these values are used for scale the temporary div to the same size as the modal
        scaleX = mProps.width / trigProps.width;
        scaleY = mProps.height / trigProps.height;

        scaleX = scaleX.toFixed(3); // round to 3 decimal places
        scaleY = scaleY.toFixed(3);


        // these values are used to move the button to the center of the window
        transX = Math.round(xc - trigProps.left - trigProps.width / 2);
        transY = Math.round(yc - trigProps.top - trigProps.height / 2);

        // if the modal is aligned to the top then move the button to the center-y of the modal instead of the window
        if (m.classList.contains('modal--align-top')) {
            transY = Math.round(mProps.height / 2 + mProps.top - trigProps.top - trigProps.height / 2);
        }


        // translate button to center of screen
        trig.style.transform = 'translate(' + transX + 'px, ' + transY + 'px)';
        trig.style.webkitTransform = 'translate(' + transX + 'px, ' + transY + 'px)';
        // expand temporary div to the same size as the modal
        div.style.transform = 'scale(' + scaleX + ',' + scaleY + ')';
        div.style.webkitTransform = 'scale(' + scaleX + ',' + scaleY + ')';


        window.setTimeout(function() {
            window.requestAnimationFrame(function() {
                open(m, div);
            });
        }, contentDelay);

    };

    let open = function(m, div) {

        if (!isOpen) {
            // select the content inside the modal
            let content = m.querySelector('.modal__content');
            // reveal the modal
            m.classList.add('modal--active');
            // reveal the modal content
            content.classList.add('modal__content--active');

            /**
             * when the modal content is finished transitioning, fadeout the temporary
             * expanding div so when the window resizes it isn't visible ( it doesn't
             * move with the window).
             */

            content.addEventListener('transitionend', hideDiv, false);

            isOpen = true;
        }

        function hideDiv() {
            // fadeout div so that it can't be seen when the window is resized
            div.style.opacity = '0';
            content.removeEventListener('transitionend', hideDiv, false);
        }
    };

    let close = function(event) {

        event.preventDefault();
        event.stopImmediatePropagation();

        let target = event.target;
        let div = document.getElementById('modal__temp');

        /**
         * make sure the modal__bg or modal__close was clicked, we don't want to be able to click
         * inside the modal and have it close.
         */

        if (isOpen && target.classList.contains('modal__bg') || target.classList.contains('modal__close')) {

            // make the hidden div visible again and remove the transforms so it scales back to its original size
            div.style.opacity = '1';
            div.removeAttribute('style');

            /**
             * iterate through the modals and modal contents and triggers to remove their active classes.
             * remove the inline css from the trigger to move it back into its original position.
             */

            for (let i = 0; i < len; i++) {
                modals[i].classList.remove('modal--active');
                content[i].classList.remove('modal__content--active');
                trigger[i].style.transform = 'none';
                trigger[i].style.webkitTransform = 'none';
                trigger[i].classList.remove('modal__trigger--active');
            }

            // when the temporary div is opacity:1 again, we want to remove it from the dom
            div.addEventListener('transitionend', removeDiv, false);

            isOpen = false;

        }

        function removeDiv() {
            setTimeout(function() {
                window.requestAnimationFrame(function() {
                    // remove the temp div from the dom with a slight delay so the animation looks good
                    div.remove();
                });
            }, contentDelay - 50);
        }

    };

    let bindActions = function() {
        for (let i = 0; i < len; i++) {
            trigger[i].addEventListener('click', getId, false);
            closers[i].addEventListener('click', close, false);
            modalsbg[i].addEventListener('click', close, false);
        }
    };

    let init = function() {
        bindActions();
    };

    return {
        init: init
    };

}());

Modal.init();