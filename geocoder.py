import geocoder

def bbox(input):
	g = geocoder.google(input)
	west = g.west
	east = g.east
	north = g.north
	south = g.south