const Client = require('../models/Client.model');

// @desc    Get clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
    const clients = await Client.find({ user: req.user.id });
    res.status(200).json(clients);
};

// @desc    Set client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
    console.log('createClient called by user:', req.user ? req.user.id : 'unknown');
    console.log('Request body:', req.body);

    if (!req.body.name) {
        return res.status(400).json({ message: 'Please add a name field' });
    }

    try {
        const client = await Client.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            user: req.user.id,
        });

        console.log('Client created:', client);
        res.status(200).json(client);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
    const client = await Client.findById(req.params.id);

    if (!client) {
        return res.status(404).json({ message: 'Client not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the client user
    if (client.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedClient = await Client.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
        }
    );

    res.status(200).json(updatedClient);
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
    const client = await Client.findById(req.params.id);

    if (!client) {
        return res.status(404).json({ message: 'Client not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the client user
    if (client.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await client.deleteOne();

    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getClients,
    createClient,
    updateClient,
    deleteClient,
};
