(function ($) {
  $(document).ready(function () {
    /** List of form elements to track */
    const formElements = ['input', 'textarea', 'select'];

    /**
     * Stores the interaction state for each form using a WeakMap.
     * Note: Should be replaced with a plain object if forms are re-rendered dynamically.
     */
    const formStates = new WeakMap();

    /**
     * Sends an event to Google Tag Manager (if available).
     * Adds current page path and timestamp to the event payload.
     *
     * @param {Object} data - Custom event data to send
     */
    function sendEvent(data = {}) {
      const eventData = {
        path: getCurrentPath(),
        timestamp: new Date().toISOString(),
        ...data,
      };

      if (Array.isArray(window.dataLayer)) {
        console.log('Data sent to GTM:', eventData);
        window.dataLayer.push(eventData);
      } else {
        console.warn('GTM is not loaded');
      }
    }

    /**
     * Handles a field interaction inside a form.
     * Sends a 'form_start' event once per form, and 'form_field_interaction' for each field.
     *
     * @param {jQuery} $form - The form jQuery object
     * @param {string} fieldName - The field name
     * @param {string} value - The field value
     */
    function handleInteraction($form, fieldName, value) {
      const formExtraId = getFormExtraId($form);
      const state = formStates[formExtraId];
      if (!state || state.submitted) return;

      if (!state.started) {
        sendEvent({
          event: 'form_start',
        });
        state.started = true;
      }

      state.fieldInteractionCounts[fieldName] = (state.fieldInteractionCounts[fieldName] || 0) + 1;

      sendEvent({
        event: 'form_field_interaction',
        field: fieldName,
        value: value || '',
        count: state.fieldInteractionCounts[fieldName],
      });
    }

    /**
     * Attaches a change listener to a field to track user interaction.
     *
     * @param {jQuery} $form - The form containing the field
     * @param {jQuery} $field - The field element
     */
    function trackField($form, $field) {
      const fieldName = $field.attr('name');
      if (!fieldName) return;

      $field.off('change.formTracker').on('change.formTracker', function () {
        let value;
        if ($field.attr('type') === 'checkbox') {
          value = $field.is(':checked') ? 'on' : 'off';
        } else {
          value = $field.val();
        }

        handleInteraction($form, fieldName, value);
      });
    }

    /**
     * Tracks all fields inside a form and listens for form submission.
     * Sends a `form_submit` event with all form data on submit.
     *
     * @param {jQuery} $form - The form element
     */
    function trackForm($form) {
      const formExtraId = getFormExtraId($form);
      if (formStates[formExtraId]) return;

      formStates[formExtraId] = {
        submitted: false,
        started: false,
        fieldInteractionCounts: {},
      };

      $form.off('submit.formTracker').on('submit.formTracker', function () {
        const state = formStates[formExtraId];
        if (!state.submitted) {
          state.submitted = true;

          /** Collect all field values from the form */
          const formData = {};
          $form.find(formElements.join(',')).each(function () {
            const $field = $(this);
            const name = $field.attr('name');
            if (!name) return;

            if ($field.attr('type') === 'checkbox') {
              formData[name] = $field.is(':checked') ? 'on' : 'off';
            } else {
              formData[name] = $field.val();
            }
          });

          /** Send a final form submission event including all form data */
          sendEvent({
            event: 'form_submit',
            data: formData,
          });
        }
      });

      $form.find(formElements.join(',')).each(function () {
        trackField($form, $(this));
      });
    }

    /**
     * Returns the current path without a trailing slash.
     * Used for event metadata.
     *
     * @returns {string} Cleaned URL path
     */
    function getCurrentPath() {
      let currentPath = window.location.pathname;
      if (currentPath.length > 1) {
        currentPath = currentPath.replace(/\/$/, '');
      }
      return currentPath;
    }

    /**
     * Generates a unique form identifier based on the page path and form ID.
     * Used as a key to store and retrieve form state.
     *
     * @param {jQuery} $form - The form element
     * @returns {string} Unique form identifier
     */
    function getFormExtraId($form) {
      const formId = $form.attr('id') || '';
      const path = window.location.pathname
        .replace(/^\//, '')
        .replace(/\//g, '-');

      return `${path}-${formId}`;
    }

    /** Tracks all currently available forms on an initial load */
    $('form').each(function () {
      trackForm($(this));
    });

    /**
     * Observes the DOM for newly added forms or fields.
     * Automatically tracks them once added.
     */
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        $(mutation.addedNodes).each(function () {
          const $node = $(this);
          if ($node.is('form')) {
            trackForm($node);
          } else {
            $node.find('form').each(function () {
              trackForm($(this));
            });
            $node.find(formElements.join(',')).each(function () {
              trackField($(this).closest('form'), $(this));
            });
          }
        });
      });
    });

    /** Start observing the body for DOM changes (added nodes) */
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
})(jQuery);
