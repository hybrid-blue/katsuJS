export const template = {
  vertical:`
    <div class="main layout-v">
      <div class="left-col nav"></div>
      <div class="right-col">
        <div id="view" class="view-content"></div>
        <div class="footer"></div>
      </div>
    </div>
  `,
  horizontal:`
    <div class="main layout-h">
      <div class="top-row nav"></div>
      <div class="bottom-row">
        <div id="view" class="view-content"></div>
        <div class="footer"></div>
      </div>
    </div>
  `,
  mobile:`
    <div class="main layout-m">
      <div class="top-row">
        <div id="view" class="view-content"></div>
      </div>
      <div class="bottom-row nav"></div>
    </div>
  `
};
