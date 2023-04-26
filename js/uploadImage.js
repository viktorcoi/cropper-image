$(document).ready(function() {

    let widthDisplay = window.innerWidth, initialPoint;

    window.onresize = () => {
        return widthDisplay = window.innerWidth;
    };

    const blockImage = $('.popup-image-upload__popup-for-image');
    const image = $('#preview-image');
    const plug = $('.popup-image-upload__popup-plug');
    const arrPopup = [$(".popup-image-upload__bg-popup")];
    let croppedCanvas;

    const openPopup = (popup) => {
        $('body').addClass("overflow");
        popup.addClass("open");
        image.attr('src', ''); 
        $(".popup-image-upload__popup-buttons--save").find('span').hide();
    }

    const closePopup = () => {
        $(".popup-image-upload").children("div").removeClass("open");
        $('body').removeClass("overflow");
        hideBlockCropper();
        if (widthDisplay < 431) 
        $(blockImage).parent().css('width', ``);
        resize('', '', '', '');
        $("#file-input").val("");
    }

    $($(".popup-image-upload__cross")).on('click', closePopup);

    $(arrPopup).each((id) => {
        $(arrPopup[id]).on('mousedown', (e) => {
            if (!e.target.closest("div").closest(`.${$(arrPopup[id]).children("div").attr("class").split(' ')[0]}`))
            closePopup();
        })
    })

    $(document).on('click', (e) => {
        const target = $(e.target);
        let btnPopup = target.closest('.upload-image');
        if (btnPopup.length) 
        openPopup(arrPopup[0]);
    })

    const resize = (bh, bw, ih, iw) => { // функиця для изменения размера блока для фотографии в попапе 
        $(blockImage).css('height', `${bh}`);
        $(blockImage).css('width', `${bw}`);
        $(image).css('height', `${ih}`);
        $(image).css('width', `${iw}`);
    }

    const hideBlockCropper = () => {
        setTimeout(() => {
            image.cropper('destroy');
            $(blockImage).hide();
            $(plug).show();
        }, 300)
    }

    $('.popup-image-upload__bg-popup').on('touchstart', function(e) {
        initialPoint = e.originalEvent.changedTouches[0];
    });

    $('.popup-image-upload__bg-popup').on('touchend', function(e) {
        if (widthDisplay <= 600) {
            const finalPoint = e.originalEvent.changedTouches[0]
            let yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
            if (yAbs > 50) {
                if (finalPoint.pageY > initialPoint.pageY && !$(e.target).closest('.popup-image-upload__popup-for-image').length)
                closePopup();
            } 
        }
    });

    $('#file-input').on('change', function() {
        let file = this.files[0]; // Получаем выбранный файл
        if (file && file.size < 5242881) { // проверка загрузки файла
            $(plug).addClass('loading-plug');
            image.cropper('destroy'); // отключаем кроппер
            const reader = new FileReader(); // Создаем объект FileReader для чтения файла
            reader.readAsDataURL(file); // Читаем файл как data URL
            reader.onload = function() { // Обработчик завершения чтения файла
                image.attr('src', '');
                image.attr('src', reader.result); // Устанавливаем data URL как значение атрибута "src" для элемента "img"
                resize('', '', '', '');
                const img = new Image();
                img.src = reader.result;
                img.onload = function() {
                    const width = img.width;
                    const height = img.height;
                    $(blockImage).show();
                    $(plug).hide();
                    $(plug).removeClass('loading-plug');
                    image.cropper({
                        zoomable:  false,
                        aspectRatio: 1,
                        viewMode: 0,
                        cropBoxResizable:  true,
                    });
                    if (width > height) {
                        if (widthDisplay < 431) {
                            $(blockImage).parent().css('width', `100%`);
                            resize('', '100%', 'auto', '100%');
                        }
                        else 
                        resize('', '400px', 'auto', '400px');
                    } else {
                        if (widthDisplay < 345) 
                        resize('320px', '', '320px', 'auto');
                        else
                        resize('400px', '', '400px', 'auto');
                    }
                    $(".popup-image-upload__popup-buttons--save").off('click').on('click', function () {
                        if ($("#file-input").val() != '') {
                            $(this).find('span').show();
                            setTimeout(() => {
                                croppedCanvas = image.cropper('getCroppedCanvas');
                                closePopup();
                                $('.image-full').attr('src', reader.result);
                                $('.image-mini').attr('src', croppedCanvas.toDataURL());

                            }, 10);
                        }
                    })
                };
            };
        } else {
            alert("Выберите файл, размер которого не превышает 5 МБ");
        }
    });
});