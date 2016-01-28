drop table if exists pastes;
create table pastes (
	id integer primary key autoincrement,
	cipher text not null,
	expiration text not null,
	added integer not null
);

