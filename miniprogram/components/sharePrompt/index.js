// components/sharePrompt/index.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onClick() {
      this.triggerEvent('click');
    }
  }
});
