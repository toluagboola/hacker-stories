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
import { Check } from "react-feather";

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
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

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

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
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
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

// const getSumComments = (stories) => {
//   return stories.data.reduce((result, value) => result + value.num_comments, 0);
// };

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

  // Handle story removal from list
  const handleRemoveStory = useCallback((item: Story) => {
    dispatchStories({
      type: "REMOVE_STORY",
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

  // const sumComments = getSumComments(stories);

  return (
    <div className="container has-text-centered has-text-white">
      <h1 className="title is-3">Hacker Stories</h1>
      {/*<h3 className="subtitle has-text-link">{sumComments} total comments</h3>*/}

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children?: React.ReactNode;
};

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}: InputWithLabelProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div className="control">
      <input
        ref={inputRef}
        className="input mb-4"
        type={type}
        id={id}
        value={value}
        onChange={onInputChange}
        autoFocus={isFocused}
        placeholder="Search for a story"
      />
    </div>
  );
};

// class InputWithLabel extends React.Component {
//   constructor(props) {
//     super(props);
//     this.inputRef = React.createRef();
//   }

//   componentDidMount() {
//     if (this.props.isFocused) {
//       this.inputRef.current.focus();
//     }
//   }

//   render() {
//     const { id, type = "text", value, isFocused, onInputChange } = this.props;
//     return (
//       <div className="control">
//         <input
//           ref={this.inputRef}
//           className="input mb-4"
//           type={type}
//           id={id}
//           value={value}
//           onChange={onInputChange}
//           autoFocus={isFocused}
//           placeholder="Search for a story"
//         />
//       </div>
//     );
//   }
// }

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};

const List = ({ list, onRemoveItem }: ListProps) => (
  <div className="py-2">
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </div>
);

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => {
  return (
    <div className="py-3 has-text-left">
      <p>
        <a className="is-size-5 has-text-weight-medium" href={item.url}>
          {item.title}
        </a>
      </p>
      <p className="pb-1 is-capitalized">
        <strong>Author:</strong> {item.author}
      </p>
      <p className="pb-1 is-capitalized">
        <strong>Comments:</strong> {item.num_comments}
      </p>
      <p className="pb-1 is-capitalized">
        <strong>Points:</strong> {item.points}
      </p>
      <button
        type="button"
        className="button is-small mt-2 dismiss"
        onClick={() => onRemoveItem(item)}
      >
        <span className="icon">
          <Check />
        </span>
        <span>Check</span>
      </button>
    </div>
  );
};

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}: SearchFormProps) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      Search
    </InputWithLabel>
    <button className="button m-3" type="submit" disabled={!searchTerm}>
      Search
    </button>
  </form>
);

export default App;
export { SearchForm, InputWithLabel, List, Item };
