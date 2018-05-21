CREATE TABLE Animation
(
	Anim_ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY, 
    Anim_Video NVARCHAR(20) NOT NULL, 
    Anim_Title NVARCHAR(50) NOT NULL, 
    Anim_Thumbnail NVARCHAR(60) NOT NULL, 
    Anim_Date DATE NOT NULL, 
    Anim_Description NVARCHAR(MAX) NULL
);

CREATE TABLE Feature
(
	Anim_ID INT NOT NULL PRIMARY KEY REFERENCES Animation(Anim_ID) ON DELETE CASCADE, 
    Feature_Order INT NOT NULL
);

CREATE TABLE Series
(
	Series_ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
	Series_Title NVARCHAR(50) NOT NULL,
	Series_Thumbnail NVARCHAR(60) NOT NULL,
	Series_Description NVARCHAR(MAX) NULL,
	Series_Order INT NOT NULL
);

CREATE TABLE Animation_Series
(
	Anim_ID INT NOT NULL REFERENCES Animation(Anim_ID) ON DELETE CASCADE,
	Series_ID INT NOT NULL REFERENCES Series(Series_ID) ON DELETE CASCADE,
	AS_ORDER INT NOT NULL
	PRIMARY KEY(Anim_ID, Series_ID)
);

CREATE TABLE Artwork
(
	Art_ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
	Art_Image NVARCHAR(60) NOT NULL,
	Art_Type_ID INT NOT NULL REFERENCES Art_Type(Art_Type_ID),
	Art_Title NVARCHAR(50) NOT NULL,
	Art_Date DATE NOT NULL,
	Art_Thumbnail NVARCHAR(60) NOT NULL,
	Art_Description NVARCHAR(MAX) NULL,
	Art_Type NVARCHAR(6) NOT NULL
);

CREATE TABLE Tag
(
	Tag_ID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
	Tag_Title NVARCHAR(50) NOT NULL
);

CREATE TABLE Artwork_Tag
(
	Art_ID INT NOT NULL REFERENCES Artwork(Art_ID) ON DELETE CASCADE,
	Tag_ID INT NOT NULL REFERENCES Tag(Tag_ID) ON DELETE CASCADE,
	PRIMARY KEY(Art_ID, Tag_ID)
);

CREATE TABLE Administrator
(
	Admin_Username NVARCHAR(20) NOT NULL PRIMARY KEY,
	Admin_Password NCHAR(256) NOT NULL,
	Admin_Salt NCHAR(256) NOT NULL
);