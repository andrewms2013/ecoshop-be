CREATE extension if not exists "uuid-ossp";

CREATE TABLE if not exists public.products (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name text NOT NULL,
    description text ,
    price integer NOT NULL,
    picture text
);

CREATE TABLE if not exists public.stocks (
	product_id uuid PRIMARY KEY NOT NULL,
    count integer NOT NULL,
    CONSTRAINT product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO public.products(
	id, name, description, price, picture)
	VALUES (
        '945dbc2a-24ab-11ec-9621-0242ac130002',
        'Ecological bag',
        'Best ecological bag',
        100,
        'https://www.design-bags.com/wp-content/uploads/2019/03/E11166118.jpg'
    ),
    (
        '945dbc2a-24ab-11ec-9621-0242ac130003',
        'Ecological bag #2',
        'Best ecological bag #2',
        200,
        'http://2.bp.blogspot.com/-SHo334cFsuI/VMyVauKXBmI/AAAAAAAAAAs/PR2JiUNNB78/s1600/Creme-Green-Tree-(2c%2C-Eco)-Bags-.png'
    ),
    (
        '945dbc2a-24ab-11ec-9621-0242ac130004',
        'Eco cup',
        'Best ecological cup',
        300,
        'https://cdn.27.ua/sc--media--prod/default/02/ad/fe/02adfe9b-c51a-4afe-9781-0366a4b26392.jpg'
    ),
    (
        '945dbc2a-24ab-11ec-9621-0242ac130005',
        'Container for wheat',
        'Container is what your pet need',
        500,
        'https://www.ikea.com/kr/en/images/products/ikea-365-food-container-with-lid-rectangular-glass-plastic__0594322_pe675641_s5.jpg'
    )
;

INSERT INTO stocks (product_id, count) select id, trunc(1 + random() * 99) from products;
