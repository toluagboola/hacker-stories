// import { render, screen } from "@testing-library/react";
import React from "react";
import axios from "axios";
import renderer from "react-test-renderer";
import App from "./App";
import List, { Item } from "./components/List";
import SearchForm from "./components/SearchForm";

jest.mock("axios");

// Test for Item component
describe("Item", () => {
	const item = {
		title: "React",
		url: "https://reactjs.org/",
		author: "Jordan Walke",
		num_comments: 3,
		points: 4,
		objectID: 0,
	};

	const handleRemoveItem = jest.fn();
	let component;
	beforeEach(() => {
		component = renderer.create(
			<Item item={item} onRemoveItem={handleRemoveItem} />
		);
	});

	it("renders all properties", () => {
		const component = renderer.create(<Item item={item} />);
		expect(component.root.findByType("a").props.href).toEqual(
			"https://reactjs.org/"
		);
	});

	it("calls onRemoveItem on button click", () => {
		component.root.findByType("button").props.onClick();
		expect(handleRemoveItem).toHaveBeenCalledTimes(1);
		expect(handleRemoveItem).toHaveBeenCalledWith(item);
		expect(component.root.findAllByType(Item).length).toEqual(1);
	});

	test("renders snapshot", () => {
		let tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

// Test for List component
describe("List", () => {
	const list = [
		{
			title: "React",
			url: "https://reactjs.org/",
			author: "Jordan Walke",
			num_comments: 3,
			points: 4,
			objectID: 0,
		},
		{
			title: "Redux",
			url: "https://redux.js.org/",
			author: "Dan Abramov, Andrew Clark",
			num_comments: 2,
			points: 5,
			objectID: 1,
		},
	];

	it("renders two times", () => {
		const component = renderer.create(<List list={list} />);
		expect(component.root.findAllByType(Item).length).toEqual(2);
	});
});

// Test for Form component
describe("SearchForm", () => {
	const searchFormProps = {
		searchTerm: "React",
		onSearchInput: jest.fn(),
		onSearchSubmit: jest.fn(),
	};
	let component;

	beforeEach(() => {
		component = renderer.create(<SearchForm {...searchFormProps} />);
	});

	it("renders the input field with its value", () => {
		const value = component.root.findByType("input").props.value;
		expect(value).toEqual("React");
	});

	it("changes the input field", () => {
		const pseudoEvent = { target: "Redux" };
		component.root.findByType("input").props.onChange(pseudoEvent);

		expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
		expect(searchFormProps.onSearchInput).toHaveBeenCalledWith(pseudoEvent);
	});

	it("submits the form", () => {
		const pseudoEvent = {};
		component.root.findByType("form").props.onSubmit(pseudoEvent);

		expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
		expect(searchFormProps.onSearchSubmit).toHaveBeenCalledWith(pseudoEvent);
	});

	it("disables the button and prevents submit", () => {
		component.update(<SearchForm {...searchFormProps} searchTerm="" />);

		expect(component.root.findByType("button").props.disabled).toBeTruthy();
	});
});

// Test for App component
describe("App", () => {
	it("succeeds fetching data with a list", async () => {
		const list = [
			{
				title: "React",
				url: "https://reactjs.org/",
				author: "Jordan Walke",
				num_comments: 3,
				points: 4,
				objectID: 0,
			},
			{
				title: "Redux",
				url: "https://redux.js.org/",
				author: "Dan Abramov, Andrew Clark",
				num_comments: 2,
				points: 5,
				objectID: 1,
			},
		];

		const promise = Promise.resolve({
			data: {
				hits: list,
			},
		});

		axios.get.mockImplementationOnce(() => promise);
		let component;

		await renderer.act(async () => {
			component = renderer.create(<App />);
		});

		expect(component.root.findByType(List).props.list).toEqual(list);
	});

	it("fails fetching data with a list", async () => {
		const promise = Promise.reject();

		axios.get.mockImplementationOnce(() => promise);

		let component;

		await renderer.act(async () => {
			component = renderer.create(<App />);
		});

		expect(component.root.findByType("p").props.children).toEqual(
			"Something went wrong..."
		);
	});
});

// expect(
// 	component.root.findAllByProps({ children: "Jordan Walke" }).length
// ).toEqual(1);

// test("renders learn react link", () => {
// 	render(<App />);
// 	const linkElement = screen.getByText(/learn react/i);
// 	expect(linkElement).toBeInTheDocument();
// });
