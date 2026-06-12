const ordiniAcquistoEmailService = require('../services/ordiniAcquistoEmailService');

const inviaEmail = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoEmailService.inviaOrdineAcquistoEmail({
            ordineId: req.params.id,
            userId: req.user?.id,
            payload: req.body,
            contabileFile: req.file || null,
        });

        res.status(200).json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};

const listInviiEmail = async (req, res, next) => {
    try {
        const result = await ordiniAcquistoEmailService.listInviiEmailOrdineAcquisto(req.params.id);
        res.json({ status: 'success', data: result });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    inviaEmail,
    listInviiEmail,
};
