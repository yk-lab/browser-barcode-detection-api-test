// @ts-check
(() => {
  // 互換性をチェック
  if (!('BarcodeDetector' in window)) {
    alert('ご利用のブラウザーでは対応していません。');
    return;
  }

  const cameraSize = { w: 360, h: 240 };
  const canvasSize = { w: 360, h: 240 };
  const resolution = { w: 1080, h: 720 };

  const videoinputSelector = document.getElementById('videoinput_selector');
  if (!(videoinputSelector instanceof HTMLSelectElement)) return;

  const formatSelector = document.getElementById('format_selector');
  if (!(formatSelector instanceof HTMLSelectElement)) return;

  const canvasPreview = document.getElementById('canvasPreview');
  if (!(canvasPreview instanceof HTMLElement)) return;

  const video = Object.assign(document.createElement('video'), {
    width: cameraSize.w,
    height: cameraSize.h,
    autoplay: true,
  });

  // カメラのセレクタを表示
  navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      videoinputSelector.replaceChildren(
        new Option('カメラを選択してください', '', true),
        ...devices.filter((device) => device.kind === 'videoinput').map((device) => new Option(device.label, device.deviceId)),
      );
    })
    .catch((err) => {
      console.log(err.name + ": " + err.message);
      console.error(err);
    });

  videoinputSelector.addEventListener('change', () => {
    if (!videoinputSelector.value) {
      video.srcObject = null;
      return;
    }

    // video要素にWebカメラの映像を表示させる
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: resolution.w },
        height: { ideal: resolution.h },
        deviceId: videoinputSelector.value,
      }
    }).then((stream) => {
      video.srcObject = stream;
      const width = stream.getVideoTracks()[0].getSettings().width;
      const height = stream.getVideoTracks()[0].getSettings().height;
      if (width && height) {
        video.width = width / 2;
        video.height = height / 2;
      }
    });
  });

  // canvas要素をつくる
  const canvas = Object.assign(document.createElement('canvas'), {
    width: canvasSize.w,
    height: canvasSize.h,
  });
  video.addEventListener('resize', () => {
    canvas.width = video.width;
    canvas.height = video.height;
  })
  canvasPreview.appendChild(canvas);

  // コンテキストを取得する
  const canvasCtx = canvas.getContext('2d');

  // video要素の映像をcanvasに描画する
  _canvasUpdate();
  function _canvasUpdate() {
    if (canvasCtx) {
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(_canvasUpdate);
  };

  // 対応している型のセレクタを表示
  BarcodeDetector.getSupportedFormats()
    .then(supportedFormats => {
      formatSelector.replaceChildren(
        new Option('フォーマットを選択してください', '', true),
        ...supportedFormats.map((format) => new Option(format, format)),
      );
    });

  const detect = () => {
    if (videoinputSelector.value && formatSelector.value) {
      const barcodeDetector = new BarcodeDetector({ formats: [formatSelector.value] });
      barcodeDetector.detect(canvas)
        .then((barcodes) => {
          barcodes.forEach((barcode) => {
            console.log(barcode);
            alert(barcode.rawValue);
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setTimeout(() => {
            detect();
          }, 500);
        });
    } else {
      setTimeout(() => {
        detect();
      }, 500);
    }
  };
  detect();
})();

