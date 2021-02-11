class ViewerLoader {

  constructor(settings, controller, socketBinding, media) {
    this.socketBinding = socketBinding;
    this.settings = settings;
    this.media = media;
    this.controller = controller;
  }

  async initialize_(url) {
    this.socketBinding.reset();
    this.controller.reset();
    this.media.reset();

    // Ensure that we do not transmit any sync message during initialization
    // By forcing control disabled
    await this.controller.doAvoidControl(async () => {
      // Get current room settings from server and deduce the current media URL
      await this.socketBinding.sendWait({
        action: "settings",
        method: "get"
      });
      url = this.settings.data.mediaUrl || url;
      this.settings.data.mediaUrl = url;

      // Ignoring sync events from socket during this part of initialization, because media is not loaded
      await this.socketBinding.doIgnoreSync(async () => {
        await this.media.waitReady(url);
      });
    });
  }

  async loadCurrentRoomMediaStateFromServer_() {
    // Ensure that we do not transmit any sync message during initialization
    // Because those events are already known by server
    await this.controller.doAvoidControl(async () => {
      if (this.media.onInitFromServer) {
        await this.media.onInitFromServer();
      }
      // Force local sync from remote data
      await this.socketBinding.sendWait({
        action: "sync",
        method: "get",
        data: {
          media_id: this.settings.data.mediaUrl
        }
      });
    }, this.media.INIT_SYNC_TIMEOUT);
  }

  async load(url) {
    if (this.media.beforeLoad) {
      await this.media.beforeLoad();
    }
    await this.initialize_(url);
    await this.loadCurrentRoomMediaStateFromServer_();
    if (this.media.afterLoad) {
      await this.media.afterLoad();
    }
  }

}

export default ViewerLoader;
