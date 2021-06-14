import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
} from "react";
import axios from "axios";
import "bulma/css/bulma.min.css";
import "./App.css";
import SearchForm from "./components/SearchForm";
import List from "./components/List";

export type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
  isRead: boolean;
};

type Stories = Array<Story>;

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: "STORIES_FETCH_INIT";
}

interface StoriesFetchSuccessAction {
  type: "STORIES_FETCH_SUCCESS";
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: "STORIES_FETCH_FAILURE";
}

interface StoriesRemoveAction {
  type: "REMOVE_STORY";
  payload: Story;
}

interface StoriesToggleReadAction {
  type: "TOGGLE_READ";
  payload: Story;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction
  | StoriesToggleReadAction;

// Handle state transitions
const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      const storiesArr = action.payload.map((story: Story) => {
        story.isRead = false;
        return story;
      });
      console.log(storiesArr);
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: storiesArr,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "TOGGLE_READ":
      const updatedArray = state.data.map((item) => {
        if (action.payload.objectID === item.objectID) {
          item.isRead = !item.isRead;
        }
        return item;
      });

      return {
        ...state,
        data: updatedArray,
      };

    default:
      throw new Error();
  }
};

// Persist latest search query
const useSemiPersistentState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void] => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

// App component
const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  // Handle HTTP requests
  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get(url);
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [url]);

  // Handle side effects
  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const toggleReadState = useCallback((item: Story) => {
    dispatchStories({
      type: "TOGGLE_READ",
      payload: item,
    });
  }, []);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle form submission
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };

  return (
    <div className="container has-text-centered has-text-white">
      <h1 className="title is-3">Hacker Stories</h1>
      <h2 className="subtitle">Find stories on Hacker News.</h2>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p className="has-text-dark is-size-4">Loading...</p>
      ) : stories.data.length !== 0 ? (
        <List list={stories.data} onToggleRead={toggleReadState} />
      ) : (
        <p className="has-text-dark is-size-4">Not found...</p>
      )}
    </div>
  );
};

export default App;
