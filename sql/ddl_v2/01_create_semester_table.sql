create table semester (
   id   varchar(20) primary key,
   year int not null,
   term tinyint not null check ( term in ( 1,
                                           2,
                                           3,
                                           4 ) ),
   constraint uk_semester unique ( year,
                                   term )
);