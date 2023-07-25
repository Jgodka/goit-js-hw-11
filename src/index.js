import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const { formEl, inputEl, galleryEl, btnLoadMoreEl } = {
  formEl: document.querySelector('.search-form'),
  inputEl: document.querySelector('.input'),
  galleryEl: document.querySelector('.gallery'),
  btnLoadMoreEl: document.querySelector('.load-more'),
};

let page = 1;

btnLoadMoreEl.style.display = 'none';

formEl.addEventListener('submit', onSearch);
btnLoadMoreEl.addEventListener('click', onBtnLoadMore);

async function onSearch(evt) {
  evt.preventDefault();

  page = 1;
  galleryEl.innerHTML = '';

  const name = inputEl.value.trim();

  try {
    if (name !== '') {
      const response = await addPixabay(name, page);
      await message(response.data.hits.length, response.data.total);
      await createMarkup(response.data);
    } else {
      btnLoadMoreEl.style.display = 'none';
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    console.log('ERROR', error);
  }
}
async function onBtnLoadMore() {
  const name = inputEl.value.trim();
  page += 1;
  const response = await addPixabay(name, page);
  await message(response.data.hits.length, response.data.total);
  await createMarkup(response.data);
}

async function addPixabay(name, page) {
  const BASE_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '38335866-20cd572b0c67a573fa29edb86',
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };
  const response = await axios.get(BASE_URL, options);

  return response;
}

function createMarkup(arr) {
  const markup = arr.hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a class="photo-link" href="${largeImageURL}">
            <div class="photo-card">
            <div class="photo">
            <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
            </div>
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${downloads}
                        </p>
                    </div>
            </div>
        </a>`
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function message(length, totalHits, page) {
  if (length === 0) {
    btnLoadMoreEl.style.display = 'none';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

    return;
  }
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  if (page === 1) {
    btnLoadMoreEl.style.display = 'flex';
  }

  if (length >= 40) {
    btnLoadMoreEl.style.display = 'flex';
  }
  if (length < 40) {
    btnLoadMoreEl.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );

    return;
  }
}
