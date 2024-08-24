"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
// Handle new story form:
async function submitStory(evt) {
  console.debug("submitStory");
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  const username = currentUser.username;
  const storyData = { title, author, url, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.trigger("reset");
  $submitForm.slideUp("slow");
  
}


$submitForm.on("submit", submitStory);

/** Make a delete button for stories */
function makeDeleteBtn(storyId) {
  return $(`<span class="trash-can">
    <i class="fas fa-trash-alt"></i>
  </span>`);
}

// Handle deleting a story:
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

// Handle my stories page:
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story).prepend(makeDeleteBtn(story.storyId));
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}



// Handle favoriting a story:
async function favoriteStory(evt) {
  console.debug("favoriteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($(evt.target).hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  }
}

$storiesContainer.on("click", ".star", favoriteStory);

/** Make a star for favorites */
function makeStar(story) {
  const isFavorite = currentUser.favorites.some(s => s.storyId === story.storyId);
  const starType = isFavorite ? "fas" : "far";
  return $(`
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`);
}

// Put favorites list on page:
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story).prepend(makeStar(story));
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}



