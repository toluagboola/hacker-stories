import React from "react";
import { Check } from "react-feather";
import { Story } from "../App";

type Stories = Array<Story>;

type ListProps = {
	list: Stories;
	onToggleRead: (item: Story) => void;
};

const List = ({ list, onToggleRead }: ListProps) => {
	return (
		<div className="container story-grid">
			{list.map((item) => (
				<Item key={item.objectID} onToggleRead={onToggleRead} item={item} />
			))}
		</div>
	);
};

type ItemProps = {
	item: Story;
	onToggleRead: (item: Story) => void;
};

const Item = ({ item, onToggleRead }: ItemProps) => {
	return (
		<div className="card my-3 has-text-left p-4">
			<p className="mb-2">
				<a className="is-size-6 has-text-weight-medium" href={item.url}>
					{item.title}
				</a>
			</p>

			<p className="pb-1 is-capitalized">
				<strong>Points:</strong> {item.points}
			</p>
			<p className="pb-1 ">
				<strong>Comments:</strong> {item.num_comments}
			</p>
			<button
				type="button"
				className="button is-small mt-2 dismiss"
				onClick={() => onToggleRead(item)}
			>
				<span className="icon mr-2">
					<Check />
				</span>
				{item.isRead ? <span>Mark as unread</span> : <span>Mark as read</span>}
			</button>
		</div>
	);
};

export default List;
export { Item };
