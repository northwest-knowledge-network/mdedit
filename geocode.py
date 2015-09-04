#uses geocoder (https://geocoder.readthedocs.org/en/stable/api.html#forward-geocoding)
# to write a function that outputs coordinates of a bounding box around the input location

import geocoder

def bbox(place):
    g = geocoder.google(place)
    bbox_str = "North = " + str(g.north) + ", South = " +  str(g.south)  + ", East = " + str(g.east) + ", West = " + str(g.west)
    print bbox_str
