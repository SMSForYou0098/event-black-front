// components/CitySelectModal.jsx
import React, { useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";

const CitySelectModal = ({ show, onHide, org, createSlug }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState(null);

  const cities = org?.cities || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cities, search]);

  const handleChoose = (city) => {
    const citySeg = encodeURIComponent(createSlug(city));
    const orgSeg = createSlug(org?.organisation || "");
    router.push(`/events/${citySeg}/${orgSeg}?key=${org?.id}`);
    onHide();
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setError(null);
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await resp.json();
          const city =
            data?.city || data?.locality || data?.principalSubdivision || "";
          if (city) {
            const match = cities.find(
              (c) => c.toLowerCase() === String(city).toLowerCase()
            );
            if (match) {
              handleChoose(match);
            } else {
              setError(
                `Detected "${city}", but this organisation doesn't have events there.`
              );
            }
          } else {
            setError("Couldn't determine your city.");
          }
        } catch {
          setError("Error retrieving city name.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setDetecting(false);
      }
    );
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {org?.organisation
            ? `Select Your City — ${org.organisation}`
            : "Select Your City"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="citySearch">
            <Form.Control
              type="text"
              placeholder="Search for your city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form.Group>

          <Button
            variant="primary"
            className="w-100 my-3"
            onClick={detectLocation}
            disabled={detecting}
          >
            {detecting ? "Detecting..." : "Detect my location"}
          </Button>
          {error && <div className="text-danger mb-2">{error}</div>}
        </Form>

        <h5 className="text-center">Available Cities</h5>
        {cities.length === 0 ? (
          <p className="text-center text-muted mb-0">
            No cities available for this organisation yet.
          </p>
        ) : (
          <Row className="g-2 mt-1">
            {filtered.map((city) => (
              <Col xs={6} md={4} lg={3} key={city}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => handleChoose(city)}
                >
                  {city}
                </Button>
              </Col>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted mb-0">No matches.</p>
            )}
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CitySelectModal;
