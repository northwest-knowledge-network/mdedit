#uses geocoder (https://geocoder.readthedocs.org/en/stable/api.html#forward-geocoding)
# to write a function that outputs coordinates of a bounding box around the input location
#the setup.py from the folder hosting geocoder and this script has to be installed first

import geocoder

def bbox(input):
    g = geocoder.google(input)
    print g.north
    print g.south
    print g.east
    print g.west